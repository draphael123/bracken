/* tools/hero-hurt-trace.mjs (claude/herobots, a measuring tool): which boss mode hurt the hero and what he was doing (|W warding |B guarding |swinging).
   PORT=n [BT=bosstype] [SNAPS=1] node tools/hero-hurt-trace.mjs <row> <hero> 1,2,3 [profile name or JSON e.g. {"base":"human","dkWin":0.25}] */
import { openPage } from './cdp.mjs';
import { campaignLevel } from './boss-level.mjs';
const [row, h, seeds, prof = 'human'] = process.argv.slice(2);
const [id, fl] = row.split(':'), lvl = campaignLevel(id);
const pg = await openPage({ audio: false, fonts: false });
const mk = seed => `(async()=>{BK.manualSimulation=true;const P0=BKT.PROG,h=${JSON.stringify(h)},lvl=${lvl};BKT.setHeroLevel(h,lvl);P0.skillOwned=P0.skillOwned||{};P0.loadouts=P0.loadouts||{};P0.skillOwned[h]={};P0.loadouts[h]=[];
BK.setHero(h);BK.reset({fresh:true});BK.applyUpgrades();
const led={},timeline=[];let last=null,fr=0;const s0=BK.sim.bind(BK),st0=BK.step.bind(BK);
const ring=[],snaps=[];const wrap=f=>function(n){const P=BK.P,hp0=P.hp;const r=f(n);fr++;{const es0=BK.enemies().filter(e=>e.alive).sort((a,b)=>(b.maxHp||b.hp||0)-(a.maxHp||a.hp||0))[0]||{};ring.push([+(fr/60).toFixed(2),es0.mode,+(es0.modeT||0).toFixed(2),Math.round(es0.x-P.x),P.face,es0.face,P.atk>=0?(P.atk|0):-1,(P.block?1:0)+(P.warding?2:0)+(P.aegis?4:0),P.dodge>0?1:0,P.ground?1:0,Math.round(P.hp),(BK.keys.left?1:0)+(BK.keys.right?2:0)+(BK.keys.block?4:0)+(BK.keys.jump?8:0)+(BK.keys.atk?16:0)+(BK.keys.down?32:0),Math.round(P.st),+(P.hurt||0).toFixed(2),+(P.dodge||0).toFixed(2)]);if(ring.length>70)ring.shift();}const d=hp0-P.hp;if(d>0.5){const es=BK.enemies().filter(e=>e.alive),b=(${JSON.stringify(process.env.BT||'')}?es.find(e=>e.t===${JSON.stringify(process.env.BT||'')}):null)||es.sort((a,b)=>(b.maxHp||b.hp||0)-(a.maxHp||a.hp||0))[0]||{};const k=(b.t||'?')+'|'+(b.mode||'?')+(P.warding?'|W':P.block?'|B':P.aegis?'|A':P.atk>=0?'|swinging':P.dodge>0?'|roll':'');led[k]=(led[k]||0)+d;if(snaps.length<+(globalThis.SNAPN||14))snaps.push(ring.slice(-60).filter((x,i)=>i%2==0||true).map(x=>x.join(",")).join(" | "));timeline.push([Math.round(fr/60*10)/10,Math.round(d),b.mode,Math.round(b.x-P.x),Math.round(b.y-P.y),Math.round(P.st),P.atk>=0?1:0,P.rolling?1:0]);}return r;};
BK.sim=wrap(s0);BK.step=wrap(st0);
const r=(await BK.bossLab({bosses:[${JSON.stringify(id)}],heroes:[h],maxSecs:240,healthMode:'normal',seed:${+seed},profile:${JSON.stringify(prof.startsWith('{')?JSON.parse(prof):prof)}${fl ? ',mini:true' : ''}})).rows[0]||{};
return {maxHp:BK.P.maxHp,outcome:r.outcome,secs:r.secs,left:r.hpLeftPct,led,timeline:timeline.slice(0,60),snaps,r:{opened:r.opened,swings:r.swings}};})()`;
const agg = {}, res = [];
for (const sd of seeds.split(',')) { await pg.reload(); const out = await pg.evalp(mk(sd), 600000); res.push(sd + ':' + out.outcome + ' ' + out.secs + 's left' + out.left + '%');
  for (const [k, v] of Object.entries(out.led)) agg[k] = (agg[k] || 0) + v; if (process.env.SNAPS) for (const x of out.snaps) console.log('S: ' + x); }
console.log('lvl', lvl, 'maxHp', 0, res.join(' | '));
console.log(Object.entries(agg).sort((a, b) => b[1] - a[1]).slice(0, 14).map(([k, v]) => k + ' ' + Math.round(v)).join('  ,  '));
pg.close();