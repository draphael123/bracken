/* GQ4TUNE-d probe: sample hero/Queen positions during P2 (escape skipped). node tools/gq4tune-probe.mjs [hero] [secs] */
import { openRetry, diffJs, fightFlasks, gqLeverJs } from './boss-run.mjs';
const h = process.argv[2] || 'knight', secs = +(process.argv[3] || 60), every = +(process.argv[4] || 90);
const pg = await openRetry(); await pg.evalp(diffJs());
const js = `(async()=>{BK.manualSimulation=true;const P0=BKT.PROG,h=${JSON.stringify(h)};BKT.setHeroLevel(h,21);P0.skillOwned=P0.skillOwned||{};P0.loadouts=P0.loadouts||{};P0.skillOwned[h]={};P0.loadouts[h]=[];if(P0.talents)P0.talents[h]={};
const FK=${JSON.stringify(fightFlasks('crown'))};P0.flaskItems=FK;P0.flaskUp=Object.keys(FK).filter(k=>['tonic','extra2','extra3'].includes(k)).length;${gqLeverJs()}BK.setHero(h);BK.reset({fresh:true});BK.applyUpgrades();const S=[];let n=0;
const r=(await BK.bossLab({bosses:['crown'],heroes:[h],maxSecs:${secs},healthMode:'normal',seed:${+(process.argv[5]||1)},profile:{base:'human',gqEscape:'skip'},onFrame:async x=>{if((BK.gqStage()==='roof')&&(n++>=0)&&(n<12||n%${every}===0)){const b=x.boss;S.push({t:+(n/60).toFixed(1),px:Math.round(x.P.x),py:Math.round(x.P.y),g:x.P.ground?1:0,bx:Math.round(b.x),by:Math.round(b.y),m:b.mode,st:b.stage,mt:+(b.modeT||0).toFixed(2),al:b.alpha,hp:Math.round(b.hp),ar:BK.L.arena?[BK.L.arena.x0,BK.L.arena.x1]:null,hid:b.hidden||b.hide||0});}}})).rows[0]||{};return {S,gq:r.gq};})()`;
const o = await pg.evalp(js, 900000); console.log(JSON.stringify(o.gq)); for (const s of o.S) console.log(JSON.stringify(s)); await pg.close();
