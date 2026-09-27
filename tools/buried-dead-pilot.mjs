/* tools/buried-dead-pilot.mjs [passes=4] — THE BURIED DEAD at NORMAL health: all six heroes, `passes` salted passes each (four is
   twenty-four fights, over the twenty-one a balance figure needs). One life per fight, no refills. Prints a row per fight and the
   summary: win rate, median win time, which of his attacks did the damage.
   And THE CAMPER: a hero put on the highest ground in his room who never moves and never swings, for sixty seconds, twice
   (once per high perch the room has). It measures what staying away costs - the thing THE SKULLS exist for (2026-09-24): before
   them, the only attack that reached the high tier was THE HANDS once a rotation. Not in the suite: it is too long. */
import { openPage } from './cdp.mjs';
const passes = +(process.argv[2] || 4), pg = await openPage({ audio: false, fonts: false }), rows = [];
try {
  for (let p = 0; p < passes; p++) { await pg.reload();
    const r = await pg.evalp(`(async()=>{BK.manualSimulation=true;
      const o=await BK.bossLab({bosses:['burial'],healthMode:'normal',maxSecs:240,modes:true,seed:${p}});
      return o.rows.map(r=>({h:r.h,won:r.outcome==='win',out:r.outcome,secs:r.secs,taken:Math.round(r.health?r.health.damageTaken:0),left:r.hpLeftPct,hitBy:r.hitBy,modes:r.modes}));})()`, 1800000);
    rows.push(...r); for (const x of r) console.log(JSON.stringify(x)); }
  const wins = rows.filter(r => r.won), secs = wins.map(r => r.secs).sort((a, b) => a - b), med = secs.length ? secs[secs.length >> 1] : null;
  const by = {}; for (const r of rows) { by[r.h] = by[r.h] || [0, 0]; by[r.h][1]++; if (r.won) by[r.h][0]++; }
  const hit = {}; for (const r of rows) for (const [m, v] of Object.entries(r.hitBy || {})) hit[m] = (hit[m] || 0) + v;
  console.log('fights ' + rows.length + ', wins ' + wins.length + ' (' + Math.round(100 * wins.length / Math.max(1, rows.length)) + '%), median win ' + med + ' s; by hero ' + Object.entries(by).map(([h, [w, n]]) => h + ' ' + w + '/' + n).join(', '));
  console.log('damage by his mode (all fights): ' + JSON.stringify(Object.fromEntries(Object.entries(hit).sort((a, b) => b[1] - a[1]))));
  await pg.reload();
  const camp = await pg.evalp(`(async()=>{const{LEVELS}=await import('/src/level.js');const{T}=await import('/src/level.js');BK.manualSimulation=true;BK.SET.speed=1;const out=[];
    let seed=77;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
    const L0=LEVELS.find(l=>l.id==='burial').build(),A0=L0.arena;
    /* the highest standable rows in the room, one perch at each end of the room's width */
    const perches=[];for(let y=Math.floor(A0.y0/16)+1;y<Math.floor(A0.floor/16);y++)for(let x=Math.floor(A0.x0/16)+1;x<Math.floor(A0.x1/16)-1;x++){const t=L0.grid[y*L0.W+x];if((t===T.ONEWAY||t===T.SOLID||t===T.PLANK)&&L0.grid[(y-1)*L0.W+x]===T.AIR&&L0.grid[(y-2)*L0.W+x]===T.AIR)perches.push([x,y]);}
    perches.sort((a,b)=>a[1]-b[1]);const top=perches[0][1],row=perches.filter(p=>p[1]===top),picks=[row[0],row[row.length-1]];
    for(const [px,py] of picks){BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='burial'));BK.state='play';BK.god=false;
      const A=BK.L.arena;BK.tp(Math.round(A.trigger/16)+1,Math.round(A.floor/16)-1);BK.sim(200);for(const e of BK.enemies())if(e!==BK.boss&&!e.maxHp)e.alive=false;
      const b=BK.boss,P=BK.P;BK.tp(px,py-1);BK.sim(2);for(const k in BK.keys)BK.keys[k]=false;P.hp=P.maxHp;const hitBy={};let lost=0,died=false,skulls=0,skullHurt=0;
      for(let f=0;f<3600;f++){const h0=P.hp,m=b.mode,near=(b.skulls||[]).some(q=>q.t>=0&&Math.abs(q.x-P.x)<24&&Math.abs(q.y-P.y+10)<24);BK.sim(1);if(b.mode==='skullTell'&&m!=='skullTell')skulls++;if(P.hp<h0){hitBy[m]=(hitBy[m]||0)+(h0-P.hp);lost+=h0-P.hp;if(near)skullHurt+=h0-P.hp;}if(P.dead){died=true;break;}}   /* a skull lands while he is in his rest, so its damage is counted apart by where it was */
      out.push({perch:[px,py],upPx:A.floor-py*16,lost,died,hitBy,skulls,skullHurt,secs:+(BK.P.dead?0:60)});}
    return out;})()`, 600000);
  for (const c of camp) console.log('CAMPER on ' + c.perch + ' (' + c.upPx + ' px up), 60 s standing still: lost ' + c.lost + (c.died ? ' and DIED' : '') + '; skulls thrown ' + c.skulls + ', skull damage ' + c.skullHurt + ' ' + JSON.stringify(c.hitBy));
  console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
