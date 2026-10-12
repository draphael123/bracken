import { openPage } from './cdp.mjs';
import { fightJs } from './boss-run.mjs';
const pg = await openPage({ audio: false, fonts: false });
let { js } = fightJs({ r: process.argv[2] || 'stockade', way: 'practiced', h: 'berserker', s: 1, profile: 'human', flasks: 'kit' }, 120);
js = js.replace("BK.bossLab({", "BK.bossLab({onFrame:(o)=>{const z=BK.bz();if(BK.P.labBzCoil>0||BK.P.labBzRel>0){(window.__lg=window.__lg||[]).push([BK.P.labBzCoil,BK.P.labBzRel,BK.keys.down?1:0,BK.keys.left?1:0,BK.keys.right?1:0,BK.P.ducking?1:0,+z.coilT.toFixed(2),BK.P.ground?1:0,BK.P.hurt>0?1:0,BK.P.atk,z.pounceT,z.pounceRec].join(','));}window.__mx=Math.max(window.__mx||0,z.rage);if(z.frenzyT>0)window.__fr=(window.__fr||0)+1;if(z.coilT>0)window.__co=(window.__co||0)+1;},");
const r = await pg.evalp(js, 600000);
const st = await pg.evalp("({mx:window.__mx,fr:window.__fr,co:window.__co,st:BK.bz().stats,cc:BK.crouchC().stats})");
console.log(r.outcome, r.secs, JSON.stringify(st.cc)); console.log(await pg.evalp("(window.__lg||[]).join(\" \")"));
pg.close();
