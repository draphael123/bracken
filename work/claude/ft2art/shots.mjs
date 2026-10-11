// usage: PORT=8808 node work/claude/ft2art/shots.mjs <prefix>   -> work/claude/ft2art/<prefix>-<name>.png
import { openPage } from '../../../tools/cdp.mjs';
import { writeFileSync } from 'fs';
const pre = process.argv[2] || 'before';
const pg = await openPage({ audio: false, fonts: false });
try {
  const info = await pg.evalp(`(async()=>{const{LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='fallingtower'));BK.state='play';BK.sim(10);
    const F=BK.L.ft2;const o={keys:Object.keys(F),x0:F.x0,x1:F.x1,floors:(F.floors||[]).map(f=>({top:f.top,bot:f.bot,theme:f.theme,debris:f.debris})),flares:F.flares,syrup:F.syrup,fizz:F.fizz,dome:F.dome,tilt:F.tilt&&{x0:F.tilt.x0,x1:F.tilt.x1,row:F.tilt.row,chests:F.tilt.chests},outer:F.outer&&{x0:F.outer.x0,x1:F.outer.x1,drop:F.outer.drop,y0:F.outer.y0,ledges:F.outer.ledges},movers:BK.movers().filter(m=>m.ft2).map(m=>({role:m.role,x:m.x,y:m.y,w:m.w,px:m.px,py:m.py,ax:m.ax,bx:m.bx,ay:m.ay,by:m.by})),start:BK.L.START,H:BK.L.H,W:BK.L.W,towerFloors:(BK.L.towerFloors||[]).map(f=>({top:f.top,bot:f.bot,front:f.front}))};return o;})()`, 300000);
  writeFileSync(`work/claude/ft2art/${pre}-info.json`, JSON.stringify(info, null, 1));
  console.log(JSON.stringify(info).slice(0, 3000));
} finally { pg.close(); }
