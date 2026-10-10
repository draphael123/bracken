// tools/fire-room.mjs - THE ARCHMAGE'S FIRE ROOM, FIXED (claude/fallingtower2; Daniel 10-08: "the fire room" - scratch/brief-fallingtower2.md A).
//   GRACE    pulled into the fire realm, nothing burns and nothing is cast for REALM.fire.grace s: the hero, hands off, takes nothing
//   REAL KEYS every hero (all seven), on the carpet with the game's own keys only - up/down/left/right and the dodge, no teleport - flies
//            25 s of the fire room reading only what is DRAWN (the glowing tiles, the wall's vents and the wall, the bolts) and is never
//            caught by the burning floor or by his fire wall going out; coming back he dodges through it (it runs on into him)
// usage: PORT=8790 node tools/fire-room.mjs [--heroes=knight,...]
import assert from 'node:assert/strict';
import { openRetry } from './boss-run.mjs';   /* (a page tried three times: under a loaded machine a first navigate can miss its 15 s) */
import { REALM } from '../src/mage-realms.js';
import { TOP as SPIRAL_TOP } from '../src/spiral-chase.js';
const arg = process.argv.find(a => a.startsWith('--heroes='));
const heroes = arg ? arg.slice(9).split(',') : ['knight', 'warden', 'pyro', 'paladin', 'pirate', 'reaper', 'geomancer'];
const pg = await openRetry(); const rows = [];
try { for (const h of heroes) {
  await pg.reload();
  const r = await pg.evalp(`(async()=>{const{LEVELS}=await import('/src/level.js');const MR=await import('/src/mage-realms.js');BK.manualSimulation=true;const out={h:${JSON.stringify(h)}};
    BK.setHero(out.h);BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='fallingtower'));BK.state='play';BK.sim(10);
    BK.tp(${SPIRAL_TOP.check},${SPIRAL_TOP.row});BK.sim(5);if(!BK.carpet())BK.board();BK.sim(30);const b=BK.boss||BK.enemies().find(e=>e.t==='undeadmage'&&e.alive);for(let i=0;i<300&&b.mode==='wake';i++)BK.sim(1);
    const P=BK.P,A=BK.L.arena;b.hp=Math.floor(b.hp0*0.75);b.realmRest=0;b.realmN=0;b.mode='hover';b.modeT=0;b.blinkT=99;
    for(let i=0;i<600&&!b.realm;i++){P.hp=P.maxHp;BK.sim(1);}out.realm=b.realm&&b.realm.kind;if(!b.realm)return out;
    const log=[];BK.log={push(o){if(o.k==='dmgP'){const R0=BK.boss&&BK.boss.realm,W0=R0&&R0.wall;log.push({t:o.t,blow:o.blow,res:o.res,back:W0?W0.back:null,wy:W0?Math.round(W0.y):null,py:Math.round(BK.P.y-8),gt:R0?+(R0.t||0).toFixed(2):null,mode:BK.boss.mode});};}};
    const k=BK.keys,clear=()=>{for(const q of ['left','right','up','down','jump','atk','block'])k[q]=false;};
    /* THE GRACE: hands off */
    const hp0=P.hp;clear();let f=0;for(;f<Math.round(${REALM.fire.grace}*60)-3;f++)BK.sim(1);out.grace=hp0-P.hp;out.graceHits=log.length;
    /* THE ROOM, by the keys: read the tiles, the wall, the bolts */
    const R=b.realm,tw=${REALM.w}/${REALM.fire.n};let dodges=0,scorched=false,edge=0,away=0;
    for(let n=0;n<60*25&&b.realm;n++){P.hp=Math.max(P.hp,P.maxHp*0.5);clear();const box=MR.realmBox(b,A),py=P.y-8,W=R.wall;let vx=0,vy=0;
      const ti=Math.floor((P.x-box.x0)/tw);
      if((R.ph==='tell'||R.ph==='burn')&&R.lit&&R.lit.includes(ti)){let best=null;for(let j=0;j<${REALM.fire.n};j++)if(!R.lit.includes(j)&&(best===null||Math.abs(j-ti)<Math.abs(best-ti)))best=j;if(best!==null)vx=Math.sign(box.x0+(best+0.5)*tw-P.x);}
      if(b.mode==='wallTell'){if(!edge)edge=py<(box.y0+box.y1)/2?-1:1;vy=edge;}   /* the vents glow at your height, and it rises there: take it to an edge, then go the other way */
      if(W&&!W.back){const closing=(P.x-W.x)*W.d>0;if(!away)away=W.y<(box.y0+box.y1)/2?1:-1;if(closing&&Math.abs(py-W.y)<${REALM.fire.wallH}/2+40)vy=away;else if(closing)vy=0.0001;}else{away=0;if(b.mode!=='wallTell')edge=0;}
      if(W&&W.back){const closing=(P.x-W.x)*W.d>0;if(closing&&Math.abs(W.x-P.x)<30&&!W.hitP&&!(P.dodge>0)&&P.st>=10){P.face=-W.d;k[W.d>0?'left':'right']=true;BK.press('dodge');dodges++;}}
      for(const q of b.shots||[]){const d=Math.hypot(q.x-P.x,q.y-py),cl=((P.x-q.x)*q.vx+(py-q.y)*q.vy)>0;if(cl&&d<34&&!(P.dodge>0)&&P.st>=10){BK.press('dodge');dodges++;break;}}
      if(vy===0.0001)vy=0;else if(!vy){const mid=(box.y0+box.y1)/2;if(Math.abs(py-mid)>30)vy=Math.sign(mid-py);}
      if(vx>0)k.right=true;else if(vx<0)k.left=true;if(vy>0)k.down=true;else if(vy<0)k.up=true;
      BK.sim(1);if(b.mode==='scorched')scorched=true;}
    clear();out.log=log;out.blows=log.map(q=>q.blow);out.dodges=dodges;out.scorched=scorched;return out;})()`, 600000);
  rows.push(r); console.log(JSON.stringify(r)); } } finally { pg.close(); }
for (const r of rows) {
  assert.equal(r.realm, 'fire', r.h + ': the fire realm is never torn');
  assert.ok(r.grace === 0 && r.graceHits === 0, r.h + ': hurt in the fire room\'s arrival grace: ' + JSON.stringify(r));
  const floor = r.blows.filter(b => b === "THE BURNING FLOOR" || b === "THE FLOOR BURNS").length, out = r.blows.filter(b => b === 'HIS FIRE WALL').length;
  assert.equal(floor, 0, r.h + ': caught by the burning floor flying by what is drawn: ' + r.blows);
  assert.ok(out <= 0, r.h + ': caught by his fire wall flying by its tell and its vents: ' + r.blows); }
console.log('ok  fire-room  ' + rows.length + ' heroes: ' + REALM.fire.grace + ' s of grace untouched, then 25 s of the fire room flown by the keys - never caught by the floor or the wall (' + rows.map(r => r.h + (r.scorched ? '*' : '')).join(' ') + '; * = his wall dodged back into him)');
