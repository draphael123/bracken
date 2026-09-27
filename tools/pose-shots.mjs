// tools/pose-shots.mjs — THE OTHER FOUR HEROES' POSES, AS THE GAME DRAWS THEM. The real page in Chrome, stepped with the draw on
// (BK.step renders, with its glows and its 'lighter' fire), so what is on the sheet is what the player sees - not a Node render,
// which draws light flat. One picture a hero (docs/poses2/<hero>.png): every active of his, bought alone and pressed on a flat floor
// with a held, unkillable foe ahead to aim at, caught six times across the move in a crop wide enough to hold its effect; then the
// jump and the landing. Made for Daniel to judge the poses by eye without playing every ability (lane P, 2026-09-24).
//   node tools/pose-shots.mjs            -> docs/poses2/paladin.png, pyro.png, pirate.png, reaper.png
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { openPage, ROOT } from './cdp.mjs';
import { SKILLS } from '../src/progression-catalog.js';

const HEROES = { paladin: 'THE PALADIN', pyro: 'THE PYROMANCER', pirate: 'THE FREEBOOTER', reaper: 'THE DEATH KNIGHT' };
const actives = h => [...new Set(SKILLS.filter(s => s.active && s.hero === h).map(s => s.id))];
const AT = [2, 5, 9, 14, 20, 28];          /* frames after the press */
const CW = 112, CH = 80, SC = 3;           /* the crop round the hero (more ahead of him than behind), and how much it is blown up */
const pg = await openPage({ audio: false, fonts: false });
try {
  await pg.evalp(`(async()=>{const {xpFloor}=await import('/src/xp.js');
    window.__kit=(hero,ids,foe)=>{BK.manualSimulation=true;BK.SET.speed=1;BK.setHero(hero);BK.reset({fresh:true});BKT.PROG.xp[hero]=xpFloor(24);
      BKT.PROG.skillOwned[hero]=Object.fromEntries(ids.map(i=>[i,true]));BKT.PROG.loadouts[hero]=ids.slice(0,4);BK.applyUpgrades();BK.load(0);BK.state='play';
      BK.enemies().forEach(e=>e.alive=false);BK.ambushes().forEach(a=>a.st='done');const L=BK.L;for(let x=2;x<40;x++)for(let y=1;y<L.H;y++)L.grid[y*L.W+x]=y>=22?1:0;
      BK.tp(10,21);BK.sim(120);BK.P.hp=BK.P.maxHp;BK.P.inv=0;BK.P.st=BK.P.maxSt;BK.P.face=1;BK.P.heat=100;
      if(foe){BK.spawnEnt({t:'sprig',x:(BK.P.x+56)/16,y:21});const e=BK.enemies().at(-1);e.hp=e.hp0=5000;e.cd=99;}};
    /* the hero in the drawn frame, allowing for a zoom kick about the middle of the screen */
    window.__crop=(label)=>{const v=BK.view,P=BK.P,z=v.z||1,sx=v.VW/2+(P.x-v.x-v.VW/2)*z,sy=v.VH/2+(P.y-v.y-v.VH/2)*z;
      const c=document.createElement('canvas');c.width=${CW};c.height=${CH};const g=c.getContext('2d');g.imageSmoothingEnabled=false;
      g.drawImage(v.buf,Math.round(sx-${CW / 3}),Math.round(sy-${CH - 14}),${CW},${CH},0,0,${CW},${CH});return {c,label:label+' '+P.lastKey+':'+P.lastFrame};};
    return 1})()`);
  mkdirSync(join(ROOT, 'docs/poses2'), { recursive: true });
  for (const [hero, title] of Object.entries(HEROES)) {
    await pg.evalp(`(()=>{window.__shots=[];return 1})()`);
    const rows = [];
    for (const id of actives(hero)) {
      await pg.evalp(`(()=>{__kit('${hero}',['${id}'],true);const s=[];BK.step(1);BK.press('throw');if(BK.stop>0&&!(BK.P.cds&&Object.keys(BK.P.cds).length)){for(let i=0;i<120&&BK.stop>0;i++)BK.step(1);BK.press('throw');}
        let f=0;for(const at of ${JSON.stringify(AT)}){BK.step(at-f);f=at;s.push(__crop('+'+at));}__shots.push(s);return 1})()`);
      rows.push(id);
    }
    /* THE JUMP AND THE LANDING: take-off, rising, the top, falling; then the three frames after touch-down */
    await pg.evalp(`(()=>{__kit('${hero}',[],false);const P=BK.P,s=[];BK.step(1);BK.keys.jump=true;BK.press('jump');BK.step(2);s.push(__crop('off'));BK.step(6);s.push(__crop('rise'));
      for(let i=0;i<60&&P.vy<-10;i++)BK.step(1);s.push(__crop('top'));for(let i=0;i<60&&P.vy<160&&!P.ground;i++)BK.step(1);s.push(__crop('fall'));
      BK.keys.jump=false;for(let i=0;i<90&&!P.ground;i++)BK.step(1);s.push(__crop('land0'));BK.step(3);s.push(__crop('land3'));BK.step(4);s.push(__crop('land7'));__shots.push(s);return 1})()`);
    rows.push('jump + landing');
    const url = await pg.evalp(`(async()=>{const rows=${JSON.stringify(rows)},shots=__shots,W=${CW * SC},H=${CH * SC},LW=170,gap=6,cols=Math.max(...shots.map(s=>s.length));
      const c=document.createElement('canvas');c.width=LW+cols*(W+gap);c.height=44+rows.length*(H+20);const g=c.getContext('2d');g.imageSmoothingEnabled=false;
      g.fillStyle='#14121c';g.fillRect(0,0,c.width,c.height);g.fillStyle='#e8dcc0';g.font='bold 18px monospace';
      g.fillText(${JSON.stringify(title)}+' - every active, as the game draws it (claude/poses2, real page, BK.step)',8,28);
      rows.forEach((r,i)=>{const y=44+i*(H+20);g.fillStyle='#e8dcc0';g.font='bold 15px monospace';g.fillText(r,8,y+H/2);
        shots[i].forEach((s,j)=>{const x=LW+j*(W+gap);g.drawImage(s.c,x,y,W,H);g.strokeStyle='#3a3450';g.strokeRect(x+.5,y+.5,W-1,H-1);
          g.fillStyle='#c9b27c';g.font='13px monospace';g.fillText(s.label,x+2,y+H+14);});});
      return c.toDataURL('image/png')})()`);
    const out = join(ROOT, 'docs/poses2', hero + '.png');
    writeFileSync(out, Buffer.from(url.split(',')[1], 'base64'));
    console.log('wrote ' + out + ' (' + rows.length + ' rows)');
  }
  if (pg.errors.length) console.log('page errors:', pg.errors);
} finally { pg.close(); }
