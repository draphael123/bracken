/* GQ5TUNE-d probe: the Princess's ALL GATES add phase - where the ads are and where the lab bot is, every 0.5 s. node tools/gq5tune-addprobe.mjs [hero] [seed] */
import { openRetry, diffJs, fightFlasks, gqLeverJs } from './boss-run.mjs';
const h = process.argv[2] || 'knight', seed = +(process.argv[3] || 1);
const pg = await openRetry(); await pg.evalp(diffJs());
const js = `(async()=>{BK.manualSimulation=true;const P0=BKT.PROG,h=${JSON.stringify(h)};BKT.setHeroLevel(h,21);P0.skillOwned=P0.skillOwned||{};P0.loadouts=P0.loadouts||{};P0.skillOwned[h]={};P0.loadouts[h]=[];if(P0.talents)P0.talents[h]={};
const FK=${JSON.stringify(fightFlasks('crown'))};P0.flaskItems=FK;P0.flaskUp=Object.keys(FK).filter(k=>['tonic','extra2','extra3'].includes(k)).length;${gqLeverJs()}BK.setHero(h);BK.reset({fresh:true});BK.applyUpgrades();const S=[];let n=0;
const r=(await BK.bossLab({bosses:['crown'],heroes:[h],maxSecs:150,healthMode:'normal',seed:${seed},mini:true,profile:'human',onFrame:async x=>{n++;const b=x.boss;const ads=(BK.enemies()||[]).filter(g=>g.gpGuard&&g.alive);if(b.shimmer&&n%30===0)S.push({t:+(n/60).toFixed(1),px:Math.round(x.P.x),py:Math.round(x.P.y),hp:Math.round(x.P.hp),bx:Math.round(b.x),by:Math.round(b.y),m:b.mode,cs:(()=>{const q=BK.gprincessHands&&BK.gprincessHands().read();return q?q.n.calls+"/"+q.n.callSpawns:null})(),ids:(BK.enemies()||[]).filter(g=>g.gpGuard&&g.alive).map(g=>(g.__id=g.__id||Math.random().toString(36).slice(2,6))).join(" "),ads:ads.map(g=>g.t+'@'+Math.round(g.x)+','+Math.round(g.y)+' hp'+Math.round(g.hp)+' '+(g.state||g.mode||''))});}})).rows[0]||{};
return {out:r.outcome,secs:r.secs,S};})()`;
const o = await pg.evalp(js, 900000); console.log(o.out, o.secs); for (const s of o.S) console.log(JSON.stringify(s)); await pg.close();
