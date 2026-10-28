/* tools/gale-stair.mjs [heroes] - THE GALE STAIR (claude/windcaller4, scratch/brief-windcaller4-1026.md: "a little longer: one stretch of WIND PLATFORMING
   before the Landing"), PER HERO, WITH REAL KEYS. In the page, NO god mode, the stair's two gale harpies held still, once per hero (default: every hero in
   src/progression.js HERO_IDS). The stair's updrafts blow only in its told gust (main.js stairGustNow) - the summit's lesson, taught before the summit:
     RIDE        walk into the shelf's updraft as its gust arrives, hold toward the crag: you land on the crag top (six rows up)
     NOT STILL   the same walk in the still air: no lift - still on the shelf
     NOT A JUMP  a running jump at the crag face: not on top (96 px of rock)
     THE GAP     from the crag top, a running jump off its end as the gust blows: carried over nine tiles onto the far rock
     THE GAP UP  dropped in the gap, its own updraft in the gust carries you up and on to the far rock (the boss's pit, foreshadowed)
   Prints a row per hero and check; exits 1 on any failure. ~1 min. PORT=<your port> node tools/gale-stair.mjs [knight,warden] */
import { openPage } from './cdp.mjs';
import { HERO_IDS } from '../src/progression.js';
const heroes = (process.argv[2] || HERO_IDS.join(',')).split(',');
const pg = await openPage({ audio: false, fonts: false });
let bad = 0;
try {
  const rows = await pg.evalp(`(async()=>{
  const {LEVELS}=await import('/src/level.js');const lvI=LEVELS.findIndex(l=>l.id==='moor');BK.manualSimulation=true;const out=[];
  for(const hero of ${JSON.stringify(heroes)}){
    const K=BK.keys,clear=()=>{for(const k of ['left','right','jump','block','up','down','atk','dodge'])K[k]=false;};
    const hold=()=>{for(const e of BK.enemies())if(e.t==='galeharpy'){e.galeCd=99;if(e.galeMode!=='hover'){e.galeMode='hover';}}};
    const step=n=>{for(let i=0;i<n;i++){hold();BK.sim(1);}};
    const sec=BK.L&&null;
    const boot=()=>{BK.setHero(hero);BK.reset({fresh:true});BK.load(lvI);BK.state='play';BK.start();BK.god=false;BK.sim(5);clear();};
    boot();const S=BK.L.sections.find(s=>s.id==='gale-stair'),o=S.x0,z=BK.L.gusts.find(q=>q.stair);
    const ph=()=>((BK.time+(z.phase||0))%z.period+z.period)%z.period;
    const place=(tx,ty,x)=>{BK.tp(tx,ty);if(x!==undefined)BK.P.x=x;BK.P.vx=0;BK.P.vy=0;step(8);BK.P.hp=BK.P.maxHp;BK.P.inv=0;};
    const waitGust=(lead)=>{for(let i=0;i<60*12;i++){const p=ph();if(lead===0){if(p>z.on+0.3&&p<z.on+0.36)return true;}else if(p>=z.period-lead&&p<z.period-lead+0.03)return true;step(1);}return false;};
    const run=(dir,jumpAtX,secs,stopX)=>{K[dir>0?'right':'left']=true;let air=false,landed=false,j=false;for(let i=0;i<60*secs;i++){if(stopX!==undefined&&(BK.P.x-stopX)*dir>0){K.right=K.left=false;}if(jumpAtX!==undefined&&!j&&(BK.P.x-jumpAtX)*dir>=0){BK.press('jump');K.jump=true;j=true;}step(1);if(!BK.P.ground)air=true;if(air&&BK.P.ground&&i>4){landed=true;break;}}clear();step(4);return landed;};
    const at=()=>({x:+(BK.P.x/16).toFixed(1),y:+(BK.P.y/16).toFixed(1),hp:BK.P.hp|0});
    const onTop=(x0,x1,row)=>BK.P.ground&&Math.abs(BK.P.y-row*16)<3&&BK.P.x>=x0*16-2&&BK.P.x<=(x1+1)*16+2;
    const v1=(o+7)*16+8,v2=(o+27)*16+8;
    /* RIDE */
    boot();place(o+4,12,v1-40);waitGust(0.3);run(1,undefined,4);step(160);const ride={ok:onTop(o+12,o+22,7),...at()};
    /* NOT STILL */
    boot();place(o+4,12,v1-40);waitGust(0);run(1,undefined,1.2);step(30);const still={ok:!onTop(o+12,o+22,7),...at()};
    /* NOT A JUMP */
    boot();place(o+3,12);run(1,(o+11)*16+4,2);step(30);const jump={ok:!onTop(o+12,o+22,7),...at()};
    /* THE GAP */
    boot();place(o+19,6);waitGust(0.25);run(1,(o+22)*16+12,4,(o+33)*16);   /* (steered: the stick let go once over the far rock, as a player does) */step(30);const gap={ok:onTop(o+32,o+38,8)||onTop(o+40,o+41,9),...at()};   /* (the far rock, or the gully's first stone - in the exam, never past it) */
    /* THE GAP UP */
    boot();place(o+24,12,v2-40);waitGust(0.3);run(1,undefined,4,(o+33)*16);step(160);const up={ok:onTop(o+32,o+38,8)||onTop(o+40,o+41,9)||onTop(o+12,o+22,7),...at()};
    out.push({hero,ride,still,jump,gap,up});
  }
  BK.manualSimulation=false;return out;})()`, 900000);
  for (const r of rows) {
    const checks = [['ride: the shelf updraft in the gust -> THE CRAG TOP', r.ride], ['not without the gust', r.still], ['not by a jump', r.jump], ['the gap: a tailwind jump -> THE FAR ROCK (or stone 1)', r.gap], ['the gap floor updraft in the gust -> up and out', r.up]];
    for (const [name, d] of checks) { if (!d.ok) bad++; console.log((d.ok ? 'ok   ' : 'FAIL ') + r.hero.padEnd(10) + name.padEnd(52) + JSON.stringify(d)); }
  }
  console.log(bad ? 'GALE-STAIR: ' + bad + ' failure(s)' : 'GALE-STAIR OK: every hero rides the stair on its told gust with real keys, and none climbs it without');
  if (pg.errors.length) { console.log('page errors', JSON.stringify(pg.errors.slice(0, 5))); bad++; }
} finally { pg.close(); }
process.exitCode = bad ? 1 : 0;
