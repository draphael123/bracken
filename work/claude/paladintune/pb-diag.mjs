/* work/claude/paladintune/pb-diag.mjs - THE PALADIN TUNE's eyes (claude/litchurch, 10-08; a measuring helper, not a check): one fight per hero x seed
   with the human+dry bot at the church's campaign level, and per fight HIS COUNTS (src/paladin-boss.js S.n: fed / drained / falters / ripostes / turned ...),
   the damage each of his moves did (S.hurt), and where his light went (lightBy: blow-landed / burn-tick / lamp / aegis-fed).
     PORT=8734 node work/claude/paladintune/pb-diag.mjs [--heroes=knight,warden,pyro] [--seeds=3] */
import { openPage } from '../../../tools/cdp.mjs';
import { campaignLevel } from '../../../tools/boss-level.mjs';
const args = process.argv.slice(2), opt = (k, d) => { const a = args.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
const heroes = opt('heroes', 'knight,warden,pyro').split(','), seeds = +opt('seeds', 3), s0 = +opt('seed0', 1), lvl = campaignLevel('church'), prof = opt('profile', 'human+dry');
const pg = await openPage({ audio: false, fonts: false });
try {
  for (const h of heroes) for (let s = s0; s < s0 + seeds; s++) {
    await pg.reload();
    const r = await pg.evalp(`(async()=>{BK.manualSimulation=true;const P0=BKT.PROG,h=${JSON.stringify(h)};BKT.setHeroLevel(h,${lvl});P0.skillOwned=P0.skillOwned||{};P0.loadouts=P0.loadouts||{};P0.skillOwned[h]={};P0.loadouts[h]=[];if(P0.talents)P0.talents[h]={};
      BK.setHero(h);BK.reset({fresh:true});BK.applyUpgrades();let last=null,why={},fr=0,hp0=null,lastWhy='-',hits=[];
      const row=(await BK.bossLab({bosses:['church'],heroes:[h],maxSecs:240,healthMode:'normal',seed:${s},profile:${JSON.stringify(prof)},onFrame:q=>{fr++;const PH=BK.paladinHands();const x=PH&&PH.read();if(x)last=x;why[q.why||'-']=(why[q.why||'-']||0)+1;if(hp0!=null&&q.P.hp<hp0)hits.push(Math.round(hp0-q.P.hp)+'@'+q.boss.mode+'<'+lastWhy);hp0=q.P.hp;lastWhy=q.boss.mode+'/'+(q.why||'-')+(q.P.block?'/B':'')+'/st'+Math.round(q.P.st||0)+'/a'+(+q.P.atk).toFixed(2)+(q.P.ground?'':'/air')+(q.P.guardTired>0?'/tired':'')+(q.P.hurt>0?'/hurt':'')+(q.P.dodge>0?'/roll':'')+'/dx'+Math.round((q.P.x-q.boss.x)*(q.boss.face||1));}})).rows[0]||{};
      return {hits,outcome:row.outcome,secs:row.secs,left:row.hpLeftPct,taken:row.health?Math.round(row.health.damageTaken):null,last,why};})()`, 1200000);
    const n = (r.last && r.last.n) || {}, hu = (r.last && r.last.hurt) || {};
    console.log(h.padEnd(7) + ' s' + s + ' ' + r.outcome + ' ' + r.secs + 's left ' + r.left + '% taken ' + r.taken + ' ph' + (r.last && r.last.ph));
    console.log('   n: ' + JSON.stringify({ ...n, moves: undefined }));
    console.log('   hurt: ' + JSON.stringify(Object.fromEntries(Object.entries(hu).map(([k, v]) => [k, Math.round(v)]))));
    if(args.includes('--hits'))console.log('   hits: '+r.hits.join(' '));console.log('   why: ' + JSON.stringify(Object.fromEntries(Object.entries(r.why).sort((a, b) => b[1] - a[1]).slice(0, 12))));
  }
} finally { pg.close(); }
