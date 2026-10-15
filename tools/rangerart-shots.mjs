// tools/rangerart-shots.mjs - THE RANGER'S ART IN THE GAME (claude/rangerart; not in the suite): idle, a drawn bow, arrows stuck/lying, the snare, a marked foe. 3x crops of the game's own canvas.
//   usage: PORT=8914 node tools/rangerart-shots.mjs <tag>  -> work/claude/shots/rangerart/<tag>-game.png
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const tag = process.argv[2] || 'after', out = join(ROOT, 'work/claude/shots/rangerart'); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false, fonts: false });
try {
  const url = await pg.evalp(`(async()=>{const {xpFloor}=await import('/src/xp.js');
    BK.manualSimulation=true;BK.SET.speed=1;BK.SET.hud='minimal';BK.setHero('ranger');BK.reset({fresh:true});BKT.PROG.xp.ranger=xpFloor(1);BK.applyUpgrades();BK.load(0);BK.state='play';BK.god=true;
    BK.enemies().forEach(e=>e.alive=false);BK.ambushes().forEach(a=>a.st='done');const L=BK.L;for(let x=2;x<70;x++)for(let y=1;y<L.H;y++)L.grid[y*L.W+x]=y>=22?1:0;
    BK.tp(10,21);BK.sim(30);const P=BK.P,K=BK.keys,tiles=[];
    const snap=(n)=>{BK.step(1);const W=BK.view.VW,H=BK.view.VH,c=document.createElement('canvas');c.width=W;c.height=H;c.getContext('2d').drawImage(BK.buf,0,0);tiles.push(c);};
    const foe=(dx)=>{BK.spawnEnt({t:'sprig',x:(P.x+dx)/16,y:21});const e=BK.enemies().at(-1);e.hp=e.hp0=5000;e.cd=99;return e;};
    snap('idle');
    const e=foe(120);K.atk=true;BK.press('atk');BK.sim(20);snap('draw');K.atk=false;BK.sim(2);BK.sim(6);snap('loose');BK.sim(40);snap('stuck');
    P.rgFocus=100;K.up=true;K.block=true;BK.sim(2);K.up=false;K.block=false;BK.sim(6);snap('mark');
    K.down=true;K.block=true;BK.sim(2);K.down=false;K.block=false;BK.sim(10);snap('snare');
    const W=tiles[0].width,H=tiles[0].height,cw=Math.round(W*0.55),Z=3,o=document.createElement('canvas');o.width=cw*Z;o.height=H*Z*Math.ceil(tiles.length/1);const g=o.getContext('2d');g.imageSmoothingEnabled=false;
    o.height=H*Z*tiles.length/2|0;o.width=cw*Z*2;tiles.forEach((t,i)=>g.drawImage(t,0,0,cw,H,(i%2)*cw*Z,Math.floor(i/2)*H*Z,cw*Z,H*Z));
    return o.toDataURL('image/png');})()`);
  writeFileSync(join(out, tag + '-game.png'), Buffer.from(url.split(',')[1], 'base64')); console.log('wrote ' + tag + '-game.png'); if (pg.errors.length) console.log(pg.errors);
} finally { pg.close(); }
