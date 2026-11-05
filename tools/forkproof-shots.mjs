// tools/forkproof-shots.mjs - (claude/forkproof) LOOK at the Knight fork: the CHOOSE YOUR PATH card at L30/L40/L50, the ROAD TO L50 strip, and each B technique in action.
//   node tools/forkproof-shots.mjs <outdir>     one headless browser; writes forkproof-card-*.png and forkproof-<tech>.png
import { writeFileSync, mkdirSync } from 'node:fs';
import { openPage } from './cdp.mjs';
const OUT = process.argv[2] || 'forkproof-shots'; mkdirSync(OUT, { recursive: true });
const pg = await openPage({ audio: false, fonts: false });
const save = (name, url) => writeFileSync(OUT + '/forkproof-' + name + '.png', Buffer.from(url.split(',')[1], 'base64'));
try {
  /* the cards: deal every owed pick (A at each fork except the one being looked at) up to the fork, shoot the pair, take B, shoot the strip */
  const cards = JSON.parse(await pg.evalp(`(async()=>{const xp=await import('/src/xp.js');const pr=BKT.PROG,out=[];BK.setHero('knight');
    const shot=()=>{BK.step(30);const v=BK.view,S=3,c=document.createElement('canvas');c.width=v.VW*S;c.height=v.VH*S;const x=c.getContext('2d');x.imageSmoothingEnabled=false;x.drawImage(v.buf,0,0,c.width,c.height);return c.toDataURL('image/png');};
    pr.xp.knight=xp.xpFloor(50);pr.card=Object.assign({},pr.card,{knight:{v:0,e:0,m:0,ms:{},up:{}}});BK.cardOpen('menu',false);BK.step(40);
    let g=0;while(BK.cardNow()&&g++<40){const c=BK.cardNow();const f=c.opts&&c.opts[0]&&c.opts[0].fork;
      if(f){out.push({name:'card-L'+c.n+(c.opts[0].capstone?'-capstone':'')+'-offer',url:shot(),opts:c.opts.map(o=>o.name+(o.rec?'*':''))});BK.cardTake(1);BK.step(10);out.push({name:'card-after-B-L'+c.n,url:shot()});}
      else BK.cardTake(0);BK.step(4);}
    BK.cardClose();BK.cardOpen('menu',true);out.push({name:'card-review-final',url:shot()});
    return JSON.stringify(out.map(o=>({...o})));})()`));
  for (const c of cards) { save(c.name, c.url); console.log(c.name, c.opts ? c.opts.join(' | ') : ''); }
  /* the techniques: 12 crops each */
  const SC = 2, CW = 260, CH = 70;
  for (const [name, setup, steps, stepN, W2] of [
    ['linkcut', "BKT.PROG.card.knight.ms={30:'klinkcut'};", `P.links=2;e.guardT=9;BK.keys.atk=true;`, 3, 160],
    ['shieldhook', "BKT.PROG.card.knight.ms={40:'kshook'};BKT.PROG.skillOwned.knight={shieldThrow:true};BKT.PROG.loadouts.knight=['shieldThrow'];", `BK.press('throw');`, 6, 300],
    ['wheel', "BKT.PROG.card.knight.ms={50:'kwheel'};", `P.links=3;BK.keys.up=true;BK.keys.block=false;BK.sim(2);BK.keys.block=true;BK.sim(1);BK.keys.block=false;BK.keys.up=false;`, 8, 300]]) {
    const url = await pg.evalp(`(()=>{for(const k in BK.keys)BK.keys[k]=false;BK.manualSimulation=true;BK.SET.speed=1;BK.setHero('knight');BK.reset({fresh:true});BKT.setHeroLevel('knight',50);
      BKT.PROG.skillOwned.knight={};BKT.PROG.loadouts.knight=[];BKT.PROG.card.knight.up={};${setup}BK.applyUpgrades();BK.load(0);BK.state='play';BK.enemies().forEach(e=>e.alive=false);BK.ambushes().forEach(a=>a.st='done');
      const L=BK.L;for(let x=2;x<80;x++)for(let y=1;y<L.H;y++)L.grid[y*L.W+x]=y>=22?1:0;BK.tp(10,21);BK.sim(60);const P=BK.P;
      Object.assign(P,{hp:P.maxHp,inv:0,hurt:0,st:P.maxSt,face:1,vx:0,dodge:0,dodgeCd:0,dash:0,dashCd:0,riposteT:0,combo:0,links:0,linkT:0,linkKeep:0});BK.sim(1);P.st=P.maxSt;
      const mk=(t,dx)=>{BK.spawnEnt({t,x:(P.x+dx)/16,y:21});const e=BK.enemies().at(-1);e.hp=e.hp0=e.maxHp0=5000;e.cd=99;e.elT=99;e.face=-1;e.speed=0;return e;};
      const foes='${name}'==='linkcut'?[mk('shield',16)]:'${name}'==='shieldhook'?[mk('archer',110),mk('sprig',60)]:[mk('shield',90),mk('sprig',150),mk('sprig',30)];const e=foes[0];
      const crop=l=>{const v=BK.view,z=v.z||1,sx=v.VW/2+(P.x-v.x-v.VW/2)*z,sy=v.VH/2+(P.y-v.y-v.VH/2)*z;const c=document.createElement('canvas');c.width=${CW};c.height=${CH};const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(v.buf,Math.round(sx-40),Math.round(sy-${CH - 12}),${CW},${CH},0,0,${CW},${CH});return {c,l};};
      const s=[];BK.step(1);${steps}
      for(let i=0;i<12*${stepN};i++){BK.step(1);if('${name}'==='linkcut'){e.x=P.x+16;e.vx=0;}if(i%${stepN}===0)s.push(crop('t'+i+(P.heavy?' HEAVY':'')+' hp'+foes.map(f=>f.hp).join('/')));}
      const W=${CW * SC},H=${CH * SC},PER=3,nr=Math.ceil(s.length/PER),c=document.createElement('canvas');c.width=PER*(W+4)+8;c.height=8+nr*(H+18);const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.fillStyle='#14121c';g.fillRect(0,0,c.width,c.height);
      s.forEach((h,j)=>{const x=8+(j%PER)*(W+4),yy=8+Math.floor(j/PER)*(H+18);g.drawImage(h.c,x,yy,W,H);g.fillStyle='#c9b27c';g.font='11px monospace';g.fillText(h.l,x+1,yy+H+12);});return c.toDataURL('image/png');})()`);
    save(name, url); console.log('wrote', name);
  }
  if (pg.errors.length) console.log('page errors:', pg.errors.slice(0, 5));
} finally { pg.close(); }
