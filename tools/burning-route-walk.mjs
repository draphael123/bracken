/* tools/burning-route-walk.mjs [heroes] - THE BURNING VILLAGE's climb, walked with real keys and NO god mode (F9, for the part the
   play bot cannot do: RULES M, it walks toward the gate's column and does not climb a gable). Waypoints along the route the rework
   made (docs/briefs/burning-village-rework.md §3): up the gable before THE FALLEN HOUSE, over it roof to roof, onto THE HALL, down to
   the second house, across THE BURNING BEAM, down the last gable, through THE BARN, up to the square's door. Creatures are put
   down (the bot cannot fight, and this is the geometry's walk), except THE BARN, which locks and is opened by killing its captain.
   Keys: left/right held, jump pressed and held; nothing is teleported after the start. Prints each leg, its time and the hero's
   health (every point lost is the level's fire). Not in the suite: it is a walk. */
import { openPage } from './cdp.mjs';
const heroes = (process.argv[2] || 'knight,warden').split(',');
/* [tile x, standing row, note] */
const WP = [[40, 25, 'the road in'], [150, 25, 'the crofts'], [204, 25, 'the long street'], [208, 22], [210, 19], [212, 16], [215, 13, 'up the gable'],
  [225, 13], [236, 13, 'over THE FALLEN HOUSE'], [245, 13], [252, 13, "the Hall's ledge"], [256, 10, "THE HALL's roof"], [267, 10], [276, 13, 'the second house'],
  [285, 13], [297, 13, 'across THE BURNING BEAM'], [307, 13], [310, 16], [312, 19], [314, 22], [318, 25, 'down to the street'], [340, 25, 'the barn'],
  [395, 25, 'through THE BARN'], [438, 25, 'the well yard'], [446, 23, "the square's door"], [459, 23, 'into his square']];
const pg = await openPage({ audio: false, fonts: false });
try {
  for (const h of heroes) {
    const r = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.setHero(${JSON.stringify(h)});BK.reset({fresh:true});
      BK.load(LEVELS.findIndex(l=>l.id==='burning'));BK.state='play';BK.god=false;BK.sim(5);const P=BK.P,k=BK.keys,WP=${JSON.stringify(WP)},out=[];
      const calm=()=>{const A=BK.ambushes()[0];for(const e of BK.enemies())if(!e.boss&&!(A&&A.leader===e))e.alive=false;};   /* (THE BARN's crowd too: this is a walk, not a fight - the ambush lab measures the fight) */
      const tile=(x,y)=>BK.L.grid[y*BK.L.W+x];
      calm();let hold=0,f=0;const hp0=P.hp;
      for(const [wx,wy,note] of WP){const t0=f;let ok=false;
        for(let i=0;i<60*45;i++,f++){if(BK.state==='talk')BK.state='play';   /* (a sign read in passing: close it and walk on) */calm();const A=BK.ambushes()[0];if(A&&A.st==='fight'&&A.leader&&A.leader.alive&&f%60===0)BKT.hurtEnemy(A.leader,99999,A.leader.x-10,false);   /* THE BARN: its captain falls, it opens */
          const dx=wx*16+8-P.x,row=Math.round(P.y/16)-1,dir=Math.sign(dx)||0;
          if(Math.abs(dx)<7&&Math.abs(row-wy)<=0&&P.ground){ok=true;break;}
          k.right=dx>4;k.left=dx<-4;
          const tx=Math.floor((P.x+dir*10)/16),gap=P.ground&&dir&&tile(tx,row+1)===0&&tile(tx,row+2)===0&&tile(tx,row+3)===0,wall=P.ground&&dir&&tile(tx,row)!==0&&tile(tx,row)!==9;
          if(P.ground&&hold<=0&&(wy<row||gap||wall)){BK.press('jump');hold=30;}
          k.jump=hold>0;hold--;if(P.dead)break;BK.sim(1);}
        k.left=k.right=k.jump=false;out.push({wp:wx+','+wy,note:note||'',ok,st:BK.state,secs:+((f-t0)/60).toFixed(1),at:Math.round(P.x/16)+','+(Math.round(P.y/16)-1),hp:Math.round(P.hp),dead:!!P.dead});if(!ok)break;}
      return {out,lost:hp0-P.hp};})()`, 1200000);
    console.log('== ' + h); for (const x of r.out) console.log((x.ok ? ' ok  ' : 'FAIL ') + x.wp.padEnd(8) + String(x.secs).padStart(6) + ' s  hp ' + x.hp + (x.dead ? ' DEAD' : '') + '  at ' + x.at + '  ' + x.note + (x.ok ? '' : '  [' + x.st + ']'));
    console.log('   ' + (r.out.every(x => x.ok) ? 'reached his square' : 'stopped') + ', health lost on the way: ' + r.lost);
  }
  console.log('errors', JSON.stringify(pg.errors.slice(0, 5)));
} finally { pg.close(); }
