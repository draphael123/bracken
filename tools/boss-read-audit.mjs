/* tools/boss-read-audit.mjs - THE BOSS-READ AUDIT (claude/bot2; Daniel 10-05, design-standard B10-B13; a measuring tool, not a check).
   For each boss: the standard bot (src/bot-profile.js) fights it with knight, warden and pyro at its campaign level, health refilled, and a
   watcher (bossLab opts.observe) reads the real state every frame:
     VULNERABILITY  blows that MET him (he was in the swing's hit set): how many hurt, how many were turned; damage dealt while OPEN vs not.
                    -> 'wall + weak point' (half the blows turned, under 10% of the damage outside openings), 'always open' (under 10% turned, most damage
                    outside openings), 'always hittable, openings pay more' (under 10% turned, most damage in openings), else 'guarded / partial'
     TURNED BLOWS   of the turned ones, how many said a word (a number / callout near him within 0.1 s) - B10: never a silent no-damage hit
     OPEN LOOK      openings, how long, and what was said as each began (B10: gold ring + timer + a word; the words are what this can see)
     BLINKS         jumps of 40+ px in one frame (a blink / teleport / burrow) a minute, and how many fell inside an opening or the second
                    after one (B12: at most once a cycle, never during or right after his own opening)
     REACH          per hero: openings seen, openings USED (he lost health in it) - B12: every hero reaches the opening with base movement
     TELLS          windups, and how many wore no mark (a pose alone)
     CLOSED         share of the fight with no opening and no damage dealt (with a high turned share: B13's waiting room)
     PORT=8644 node tools/boss-read-audit.mjs <level>[:mini],.. | --all  [--secs=120] [--heroes=knight,warden,pyro] [--profile=human] [--out=f.json] */
import { writeFileSync } from 'node:fs';
import { openPage } from './cdp.mjs';
import { campaignLevel } from './boss-level.mjs';
import { STANDARD } from '../src/bot-profile.js';
import { BOSS_ROWS } from './boss-rows.mjs';
const args = process.argv.slice(2), opt = (k, d) => { const a = args.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
const rows = args.includes('--all') ? BOSS_ROWS : args.filter(a => !a.startsWith('-')).flatMap(a => a.split(','));
const heroes = opt('heroes', 'knight,warden,pyro').split(','), secs = +opt('secs', 120), prof = opt('profile', STANDARD), OUT = opt('out', '');
const WATCH = `(()=>{const W={f:0,openF:0,wins:[],cur:null,meet:0,hurt:0,turned:0,said:0,words:{},dmgOpen:0,dmgShut:0,blinks:0,blinkOpen:0,tells:0,unmarked:0,shutF:0,lastOpenEnd:-999,x:null,hp:null,set:null,wasW:false,pend:[],recent:[]};
 window.__W=W;return (BK,b,h)=>{const P=BK.P;W.f++;const sp=(BK.SET.speed||1)/60,open=!!BK.bossOpen(b),hp=b.hp,d=W.hp===null?0:Math.max(0,W.hp-hp);W.hp=hp;
  if(open){W.openF++;if(!W.cur){W.cur={at:W.f,dmg:0,words:[]};W.wins.push(W.cur);}W.cur.dmg+=d;W.dmgOpen+=d;}else{if(W.cur){W.cur.len=(W.f-W.cur.at)*sp;W.lastOpenEnd=W.f;W.cur=null;}W.dmgShut+=d;}
  const nums=(BK.textLab&&BK.textLab.nums?BK.textLab.nums():[]).filter(n=>typeof n.txt==='string'&&n.life>0&&!n.__seen&&Math.abs(n.x-b.x)<90);for(const n of nums){n.__seen=1;if(W.cur&&W.f-W.cur.at<30)W.cur.words.push(n.txt);W.recent.push([W.f,n.txt]);}W.recent=W.recent.filter(q=>W.f-q[0]<12);
  W.pend=W.pend.filter(q=>{if(W.f-q.f>9){if(q.said){W.said++;W.words[q.said]=(W.words[q.said]||0)+1;}return false;}return true;});
  const hs=P.hitSet,sw=P.atk>=0||!!P.plunge;if(sw&&!W.sw)W.met=false;W.sw=sw;if(hs&&hs.has(b)&&!W.met){W.met=true;W.meet++;W.meetF=W.f;W.meetHp=hp+d;}   /* (P.hitSet is one Set, cleared at each swing: a swing is new when P.atk goes from -1 to 0+) */
  if(W.meetF&&W.f-W.meetF===3){if(b.hp<W.meetHp)W.hurt++;else{W.turned++;W.pend.push({f:W.meetF,said:null});}W.meetF=0;}for(const q of W.pend)if(!q.said){const w=W.recent.find(r=>r[0]>=q.f-1&&r[0]<=q.f+8);if(w)q.said=w[1];}
  if(!open&&!(d>0))W.shutF++;
  if(W.x!==null&&Math.abs(b.x-W.x)>40&&b.alive){W.blinks++;if(open||W.f-W.lastOpenEnd<60/((BK.SET.speed||1)))W.blinkOpen++;}W.x=b.x;
  const wu=!!(BK.windingUp&&BK.windingUp(b));if(wu&&!W.wasW){W.tells++;try{if(!BK.markShown(b))W.unmarked++;}catch{}}W.wasW=wu;};})()`;
const out = [];
const pg0 = await openPage({ audio: false, fonts: false }); let pg = pg0;
try { for (const r of rows) { const [id, fl] = r.split(':'), lvl = campaignLevel(id); const per = {};
  for (const h of heroes) { let o;
    try { await pg.reload();
      o = await pg.evalp(`(async()=>{BK.manualSimulation=true;const P0=BKT.PROG,h=${JSON.stringify(h)};BKT.setHeroLevel(h,${lvl});P0.skillOwned[h]={};P0.loadouts[h]=[];if(P0.talents)P0.talents[h]={};BK.setHero(h);BK.reset({fresh:true});BK.applyUpgrades();
        const obs=${WATCH};const r=(await BK.bossLab({bosses:[${JSON.stringify(id)}],heroes:[h],maxSecs:${secs},healthMode:'refill',seed:1,profile:${JSON.stringify(prof)},observe:obs${fl ? ',mini:true' : ''}})).rows[0]||{};
        const W=window.__W;return {out:r.outcome||r.skipped,boss:r.boss,secs:r.secs,left:r.hpLeftPct,f:W.f,openF:W.openF,wins:W.wins.map(w=>({len:+(w.len||0).toFixed(2),dmg:Math.round(w.dmg),words:w.words.slice(0,3)})),meet:W.meet,hurt:W.hurt,turned:W.turned,said:W.said,words:W.words,dmgOpen:Math.round(W.dmgOpen),dmgShut:Math.round(W.dmgShut),blinks:W.blinks,blinkOpen:W.blinkOpen,tells:W.tells,unmarked:W.unmarked,shutF:W.shutF};})()`, 1200000);
    } catch (e) { o = { err: String(e.message).slice(0, 100) }; try { pg.close(); } catch {} pg = await openPage({ audio: false, fonts: false }); }
    per[h] = o; console.log(r + ' ' + h + ' L' + lvl + ': ' + JSON.stringify(o).slice(0, 400)); }
  const A = Object.values(per).filter(o => !o.err && o.f), sum = k => A.reduce((s, o) => s + (o[k] || 0), 0), mins = A.reduce((s, o) => s + (o.secs || 0), 0) / 60;
  const meet = sum('meet'), turned = sum('turned'), dmgO = sum('dmgOpen'), dmgS = sum('dmgShut'), wins = A.reduce((s, o) => s + o.wins.length, 0);
  const tP = meet ? turned / meet : null, oP = dmgO + dmgS ? dmgS / (dmgO + dmgS) : null;
const model = tP === null ? 'not met' : tP >= 0.5 && oP !== null && oP < 0.1 ? 'wall + weak point' : tP < 0.1 ? (oP === null || oP >= 0.5 ? 'always open' : 'always hittable, openings pay more') : 'guarded / partial';
  const words = {}; for (const o of A) for (const [k, v] of Object.entries(o.words || {})) words[k] = (words[k] || 0) + v; const openWords = {}; for (const o of A) for (const w of o.wins) for (const t of w.words) openWords[t] = (openWords[t] || 0) + 1;
  const reach = Object.fromEntries(heroes.map(h => { const o = per[h] || {}; return [h, o.wins ? o.wins.filter(w => w.dmg > 0).length + '/' + o.wins.length : 'err']; }));
  const row = { row: r, lvl, boss: (A[0] || {}).boss, model, meet, turnedPct: meet ? Math.round(100 * turned / meet) : null, turnedSaidPct: turned ? Math.round(100 * sum('said') / turned) : null, turnedWords: words,
    openings: wins, openPerMin: mins ? +(wins / mins).toFixed(1) : null, openLenAvg: wins ? +(A.reduce((s, o) => s + o.wins.reduce((t, w) => t + w.len, 0), 0) / wins).toFixed(2) : null, openWords,
    dmgOutsideOpenPct: dmgO + dmgS ? Math.round(100 * dmgS / (dmgO + dmgS)) : null, blinksPerMin: mins ? +(sum('blinks') / mins).toFixed(1) : null, blinksInOrAfterOpen: sum('blinkOpen'),
    tells: sum('tells'), unmarkedTells: sum('unmarked'), closedPct: sum('f') ? Math.round(100 * sum('shutF') / sum('f')) : null, reach, per };
  out.push(row); if (OUT) writeFileSync(OUT, JSON.stringify(out, null, 1));
  console.log('AUDIT ' + r + ' [' + row.boss + '] ' + model + ' | met ' + meet + ', turned ' + row.turnedPct + '% (said a word ' + row.turnedSaidPct + '%) | openings ' + wins + ' (' + row.openPerMin + '/min, ' + row.openLenAvg + ' s) | dmg outside open ' + row.dmgOutsideOpenPct + '% | blinks ' + row.blinksPerMin + '/min, ' + row.blinksInOrAfterOpen + ' in/after open | tells ' + row.tells + ' (' + row.unmarkedTells + ' unmarked) | reach ' + JSON.stringify(reach)); } }
finally { try { pg.close(); } catch {} }
