// scratch probe (claude/berserker2): node work/claude/berserker2/probe.mjs '<js expr returning JSON>'
import { openPage } from '../../../tools/cdp.mjs';
import { readFileSync } from 'node:fs';
const pg = await openPage({ audio: false, fonts: false });
try {
  await pg.evalp(`(async()=>{const {xpFloor}=await import('/src/xp.js');
    window.__bz=(ids=[],lv=12)=>{BK.manualSimulation=true;BK.SET.speed=1;BK.setHero('berserker');BK.reset({fresh:true});BKT.PROG.xp.berserker=xpFloor(lv);
      BKT.PROG.skillOwned.berserker=Object.fromEntries(ids.map(i=>[i,true]));BKT.PROG.loadouts.berserker=ids.slice(0,3);BK.applyUpgrades();BK.load(0);BK.state='play';
      BK.enemies().forEach(e=>e.alive=false);BK.ambushes().forEach(a=>a.st='done');const L=BK.L;for(let x=2;x<50;x++)for(let y=1;y<L.H;y++)L.grid[y*L.W+x]=y>=22?1:0;
      BK.tp(10,21);BK.sim(30);for(const k in BK.keys)BK.keys[k]=false;const P=BK.P;P.hp=P.maxHp;P.inv=0;P.st=P.maxSt;P.face=1;P.rage=0;P.bzFightT=-99;};
    window.__foe=(dx,t='sprig',hp=5000)=>{BK.spawnEnt({t,x:(BK.P.x+dx)/16,y:21});const e=BK.enemies().at(-1);e.hp=e.hp0=hp;e.cd=99;return e;};
    return 1})()`);
  const src = readFileSync(process.argv[2], 'utf8');
  console.log(JSON.stringify(await pg.evalp(src, 300000)));
  if (pg.errors.length) console.log('ERRORS', pg.errors);
} finally { pg.close(); }
