// tools/folly-pilot.mjs [salts=1] [heroes=knight,warden,pyro] — THE ARCHMAGE (the Mage's Folly's boss, id 'archmage') through
// BK.bossLab: one fight a hero a salt, NORMAL health (can the bot live through him?) and a 240 s cap. Prints one line a fight -
// the outcome, the time, the damage taken, the openings he gave and what was landed in each, and which of his modes hurt - and a
// summary line. (tools/archmage-pilot.mjs is the OTHER archmage: the Falling Tower's undead one.) Not in the suite: it is too long.
// usage: node tools/folly-pilot.mjs                  HEALTH=refill CAP=300 node tools/folly-pilot.mjs 1,2 knight
import { openPage } from './cdp.mjs';
const salts = (process.argv[2] || '1').split(',').map(Number);
const heroes = (process.argv[3] || 'knight,warden,pyro').split(',');
const health = process.env.HEALTH || 'normal', cap = +(process.env.CAP || 240);
const pg = await openPage({ audio: false, fonts: false });
const rows = [];
try {
  for (const salt of salts) {
    await pg.reload();
    const r = await pg.evalp(`(async()=>{BK.manualSimulation=true;
      const seen={};let wasOpen=false,wasMode=null;
      const onFrame=({boss,h})=>{const s=seen[h]||(seen[h]={opens:0,hits:[],stage:1,sub:0,modes:{}});const open=boss.open>0;
        if(open&&!wasOpen){s.opens++;s.hits.push(0);s.hp0=boss.hp;} if(open&&s.hp0!==undefined&&boss.hp<s.hp0){s.hits[s.hits.length-1]++;} if(open)s.hp0=boss.hp;
        wasOpen=open;s.stage=boss.stage;const R=BK.mg&&BK.mg()&&BK.mg().A;if(R)s.sub=R.sub;if(boss.mode!==wasMode&&/Tell$/.test(boss.mode||''))s.modes[boss.mode]=(s.modes[boss.mode]||0)+1;wasMode=boss.mode;};
      const o=await BK.bossLab({bosses:['mage'],heroes:${JSON.stringify(heroes)},healthMode:${JSON.stringify(health)},maxSecs:${cap},modes:true,salt:${salt},onFrame});
      return o.rows.map(r=>({h:r.h,salt:${salt},out:r.outcome||r.skipped,secs:r.secs,taken:r.health&&Math.round(r.health.damageTaken),left:r.hpLeftPct,swings:r.swings,hitBy:r.hitBy,
        opens:seen[r.h]&&seen[r.h].opens,hitsPerOpen:seen[r.h]&&seen[r.h].hits.join(','),reached:seen[r.h]&&('stage '+seen[r.h].stage+' room '+seen[r.h].sub),tells:seen[r.h]&&seen[r.h].modes}));})()`, 3600000);
    for (const x of r) console.log(JSON.stringify(x));
    rows.push(...r);
  }
  const wins = rows.filter(r => r.out === 'win');
  console.log(JSON.stringify({ health, cap, fights: rows.length, wins: wins.length, winSecs: wins.map(r => r.secs), taken: rows.map(r => r.taken) }));
  console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
